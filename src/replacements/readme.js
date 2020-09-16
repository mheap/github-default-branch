module.exports = function ({owner, repo, old, target}) {
    return {
        path: "README.md",
        replacements: [
            {
                from: `@${old}`,
                to: `@${target}`,
            },
            {
                from: `${owner}/${repo}.svg?branch=${old}`,
                to: `${owner}/${repo}.svg?branch=${target}`,
            },
        ],
    };
}
