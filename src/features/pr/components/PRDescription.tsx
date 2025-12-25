import Markdown from 'react-markdown';

interface PRDescriptionProps {
  description: string;
}

/**
 * Renders PR description as markdown
 * S-1.2: AC-1.2.2 - Markdown rendered
 */
export function PRDescription({ description }: PRDescriptionProps) {
  if (!description.trim()) {
    return (
      <div className="px-6 pb-6 text-gray-500 italic">
        No description provided.
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      <div className="prose prose-sm max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0">
        <Markdown
          components={{
            // Open links in new tab
            a: ({ children, ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {children}
              </a>
            ),
          }}
        >
          {description}
        </Markdown>
      </div>
    </div>
  );
}
