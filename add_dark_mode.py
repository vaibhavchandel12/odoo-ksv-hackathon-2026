import os
import re

directories = ['frontend/src/pages', 'frontend/src/components']

replacements = [
    (r'\bbg-white\b(?! dark:bg-)', 'bg-white dark:bg-slate-900'),
    (r'\btext-slate-900\b(?! dark:text-)', 'text-slate-900 dark:text-white'),
    (r'\btext-slate-800\b(?! dark:text-)', 'text-slate-800 dark:text-slate-200'),
    (r'\btext-slate-700\b(?! dark:text-)', 'text-slate-700 dark:text-slate-300'),
    (r'\btext-slate-600\b(?! dark:text-)', 'text-slate-600 dark:text-slate-400'),
    (r'\btext-slate-500\b(?! dark:text-)', 'text-slate-500 dark:text-slate-400'),
    (r'\bborder-slate-200\b(?! dark:border-)', 'border-slate-200 dark:border-slate-700'),
    (r'\bborder-slate-300\b(?! dark:border-)', 'border-slate-300 dark:border-slate-600'),
    (r'\bbg-slate-50\b(?!/)(?! dark:bg-)', 'bg-slate-50 dark:bg-slate-800'),
    (r'\bbg-slate-50/50\b(?! dark:bg-)', 'bg-slate-50/50 dark:bg-slate-800/50'),
    (r'\bbg-slate-100\b(?!/)(?! dark:bg-)', 'bg-slate-100 dark:bg-slate-800'),
    (r'\bbg-slate-100/50\b(?! dark:bg-)', 'bg-slate-100/50 dark:bg-slate-800/50'),
    (r'\bborder-slate-100\b(?! dark:border-)', 'border-slate-100 dark:border-slate-800'),
]

for directory in directories:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') and file != 'AppLayout.tsx':
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                original = content
                for pattern, replacement in replacements:
                    content = re.sub(pattern, replacement, content)
                
                if original != content:
                    with open(filepath, 'w') as f:
                        f.write(content)
                    print(f'Updated {filepath}')

