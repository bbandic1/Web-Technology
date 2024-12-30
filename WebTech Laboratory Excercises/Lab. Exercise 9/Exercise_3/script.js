function convertForToWhile(cCode) {

    const forLoopRegex = /for\s*\(\s*(?<init>[^;]+);\s*(?<condition>[^;]+);\s*(?<increment>[^)]+)\s*\)\s*\{(?<body>[\s\S]*?)\}/g;

    const modifiedCode = cCode.replace(forLoopRegex, (match, init, condition, increment, body) => {
        return `{
${init};
while (${condition}) {
${body.trim()}\n${increment.trim()};
}
}`;
    });

    return modifiedCode;
}

const cCode = `#include <stdio.h>
int main() {
    int i,x;
    scanf("%d", &x);
    for (i=1; i<=10; i++) {
        printf("%d %d\n", i, pow(x,i));
    }
    return 0;
}`;

const result = convertForToWhile(cCode);
console.log(result);
