export default function formatBlock (rule) {
    // space before opening brace;
    rule.raws.between = ' ';
    rule.raws.after = '\n';
    rule.raws.semicolon = true;
};
