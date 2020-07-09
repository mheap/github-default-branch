module.exports = function (old, target) {
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