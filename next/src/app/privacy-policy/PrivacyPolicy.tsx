import React from "react";
import { data, ListItem, Paragraph } from "./privacy-policy-data";

const PrivacyPolicy: React.FC = () => {
  // 型ガード関数
  const isParagraph = (item: ListItem): item is Paragraph => {
    return (item as Paragraph).type === "paragraph";
  };

  // 再帰的にリストを描画
  const renderItems = (items: ListItem[], parentKey: string) => {
    return (
      <ol className="list-decimal list-inside ml-4 my-4">
        {items.map((item, index) => {
          const uniqueKey = `${parentKey}-${index}`;

          if (typeof item === "string") {
            return (
              <li key={uniqueKey} className="my-2 leading-relaxed">
                {item}
              </li>
            );
          } else if (Array.isArray(item)) {
            return <React.Fragment key={uniqueKey}>{renderItems(item, uniqueKey)}</React.Fragment>;
          } else if (isParagraph(item)) {
            return (
              <React.Fragment key={uniqueKey}>
                {item.content.map((line, lineIndex) => (
                  <p key={`${uniqueKey}-${lineIndex}`} className="my-2 leading-relaxed">
                    {line}
                  </p>
                ))}
              </React.Fragment>
            );
          }
          return null;
        })}
      </ol>
    );
  };

  return (
    <>
      {data.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-20">
          <h2 className="text-xl font-bold mb-2">{`第${sectionIndex + 1}条（${section.title}）`}</h2>
          {section.description && <p className="mb-2">{section.description}</p>}
          {renderItems(section.listItems as ListItem[], `section-${sectionIndex}`)}
        </div>
      ))}
    </>
  );
};

export default PrivacyPolicy;