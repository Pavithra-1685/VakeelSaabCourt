import re

with open('src/app/utils/ai.ts', 'r') as f:
    lines = f.readlines()

# Lines that are legitimate template literal delimiters (opening/closing)
# These are the only lines that should have a single unescaped backtick
issues = []
for lineno, line in enumerate(lines, 1):
    stripped = line.rstrip('\n')
    # Count unescaped backticks
    count = 0
    j = 0
    while j < len(stripped):
        if stripped[j] == '\\' and j+1 < len(stripped) and stripped[j+1] == '`':
            j += 2  # escaped backtick, skip
            continue
        if stripped[j] == '`':
            count += 1
        j += 1
    if count > 0 and count % 2 == 1:
        issues.append((lineno, count, stripped.strip()[:120]))

print(f"Lines with odd unescaped backtick count ({len(issues)} found):")
for lineno, count, snippet in issues:
    print(f"  Line {lineno:4d} ({count}x): {snippet}")

# Check if all are just template delimiters
legitimate_patterns = [
    '= `', '`: `', '",\n', '`;\n', '`,\n', '= `\n',
    'Bearer', 'Please draft', 'systemPrompt'
]

print("\nChecking for problematic non-delimiter backticks...")
problem_count = 0
for lineno, count, snippet in issues:
    line = lines[lineno-1].strip()
    # Simple heuristic: template delimiters are short lines
    if len(line) < 40 or '${' in line:
        continue  # Likely a template delimiter or interpolation
    print(f"  PROBLEM Line {lineno}: {snippet}")
    problem_count += 1

if problem_count == 0:
    print("  No problematic backticks found - file should compile cleanly!")
