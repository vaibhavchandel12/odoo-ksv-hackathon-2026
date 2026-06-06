import os
import re

directories = ['frontend/src/pages', 'frontend/src/components']

replacements = [
    (r'\btext-gray-900\b(?! dark:text-)', 'text-gray-900 dark:text-white'),
    (r'\btext-gray-800\b(?! dark:text-)', 'text-gray-800 dark:text-gray-200'),
    (r'\btext-gray-700\b(?! dark:text-)', 'text-gray-700 dark:text-gray-300'),
    (r'\btext-gray-600\b(?! dark:text-)', 'text-gray-600 dark:text-gray-400'),
    (r'\btext-gray-500\b(?! dark:text-)', 'text-gray-500 dark:text-gray-400'),
    (r'\btext-gray-400\b(?! dark:text-)', 'text-gray-400 dark:text-gray-500'),
    (r'\bborder-gray-200\b(?! dark:border-)', 'border-gray-200 dark:border-gray-700'),
    (r'\bborder-gray-300\b(?! dark:border-)', 'border-gray-300 dark:border-gray-600'),
    (r'\bbg-gray-50\b(?!/)(?! dark:bg-)', 'bg-gray-50 dark:bg-gray-800'),
    (r'\bbg-gray-50/50\b(?! dark:bg-)', 'bg-gray-50/50 dark:bg-gray-800/50'),
    (r'\bbg-gray-100\b(?!/)(?! dark:bg-)', 'bg-gray-100 dark:bg-gray-800'),
    (r'\bbg-gray-100/50\b(?! dark:bg-)', 'bg-gray-100/50 dark:bg-gray-800/50'),
    (r'\bborder-gray-100\b(?! dark:border-)', 'border-gray-100 dark:border-gray-800'),
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

