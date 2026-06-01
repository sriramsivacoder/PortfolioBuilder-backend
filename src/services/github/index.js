// ============================================================================
// GitHub Service — Fetch profile, repos, and languages via Octokit
// ============================================================================
import { Octokit } from 'octokit';
import { config } from '../../config/index.js';
import { ServiceError } from '../../types/index.js';
function createOctokit() {
    const options = {};
    if (config.githubToken) {
        options.auth = config.githubToken;
    }
    return new Octokit(options);
}
/**
 * Extract GitHub username from a URL or return as-is if already a username.
 */
function extractUsername(input) {
    // Handle full GitHub URLs
    const urlMatch = input.match(/github\.com\/([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)/i);
    if (urlMatch) {
        return urlMatch[1];
    }
    // Handle plain username
    const usernameMatch = input.match(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/);
    if (usernameMatch) {
        return input;
    }
    throw new ServiceError('Invalid GitHub URL or username', 400);
}
/**
 * Fetch a GitHub user's profile data including top repos and language stats.
 */
export async function fetchGitHubProfile(usernameOrUrl) {
    const username = extractUsername(usernameOrUrl.trim());
    const octokit = createOctokit();
    try {
        // Fetch user profile
        const { data: user } = await octokit.rest.users.getByUsername({ username });
        // Fetch public repos (sorted by stars, top 20)
        const { data: rawRepos } = await octokit.rest.repos.listForUser({
            username,
            sort: 'updated',
            direction: 'desc',
            per_page: 100,
            type: 'owner',
        });
        // Filter out forks, sort by stars, take top 20
        const sortedRepos = rawRepos
            .filter((repo) => !repo.fork)
            .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
            .slice(0, 20);
        // Map to our GitHubRepo type
        const repos = sortedRepos.map((repo) => ({
            name: repo.name,
            description: repo.description ?? undefined,
            url: repo.html_url,
            stars: repo.stargazers_count ?? 0,
            forks: repo.forks_count ?? 0,
            language: repo.language ?? undefined,
            topics: repo.topics ?? [],
            updatedAt: repo.updated_at ?? new Date().toISOString(),
        }));
        // Calculate language breakdown from all non-forked repos
        const languageCounts = {};
        for (const repo of rawRepos.filter((r) => !r.fork)) {
            if (repo.language) {
                languageCounts[repo.language] = (languageCounts[repo.language] ?? 0) + 1;
            }
        }
        // Convert to percentages
        const totalWithLanguage = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);
        const languages = {};
        if (totalWithLanguage > 0) {
            for (const [lang, count] of Object.entries(languageCounts)) {
                languages[lang] = Math.round((count / totalWithLanguage) * 100);
            }
        }
        // Calculate total stars
        const totalStars = rawRepos
            .filter((r) => !r.fork)
            .reduce((sum, repo) => sum + (repo.stargazers_count ?? 0), 0);
        return {
            username: user.login,
            bio: user.bio ?? undefined,
            avatarUrl: user.avatar_url ?? undefined,
            profileUrl: user.html_url,
            repos,
            languages,
            totalStars,
            totalContributions: user.public_repos ?? undefined,
        };
    }
    catch (error) {
        if (error instanceof Error) {
            // Handle specific GitHub API errors
            const statusCode = error.status;
            if (statusCode === 404) {
                throw new ServiceError(`GitHub user "${username}" not found`, 404);
            }
            if (statusCode === 403) {
                throw new ServiceError('GitHub API rate limit exceeded. Please try again later or provide a GitHub token.', 429);
            }
            throw new ServiceError(`Failed to fetch GitHub profile: ${error.message}`, 502);
        }
        throw new ServiceError('Failed to fetch GitHub profile: Unknown error', 502);
    }
}
