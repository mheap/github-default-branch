module.exports = function (owner, repo, old, target) {
    return {
        path: "./circleci/config.yml",
        replacements: [
            {
                from: `- ${old}`,
                to: `- ${target}`
            }
        ]
    };
}
