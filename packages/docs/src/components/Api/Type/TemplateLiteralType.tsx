import Token from '@site/src/components/Api/Code/Token';
import Type from '@site/src/components/Api/Type';
import type {JSONOutput} from 'typedoc';

export default function TemplateLiteralType({
  type,
}: {
  type: JSONOutput.TemplateLiteralType;
}) {
  return (
    <>
      <Token type="string">`{type.head}</Token>
      {type.tail.map(([type, text]) => (
        <span key={JSON.stringify(type) + text}>
          {'${'}
          <Type type={type} />
          {'}'}
          <Token type="string">{text}</Token>
        </span>
      ))}
      <Token type="string">`</Token>
    </>
  );
}
