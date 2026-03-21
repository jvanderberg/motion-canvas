import TokenList, {
  ListType,
  Separator,
} from '@site/src/components/Api/Code/TokenList';
import Type from '@site/src/components/Api/Type';
import type {JSONOutput} from 'typedoc';

export default function IntersectionType({
  type,
}: {
  type: JSONOutput.IntersectionType;
}) {
  return (
    <TokenList type={ListType.Parentheses} separator={Separator.Ampersand}>
      {type.types.map(item => (
        <Type key={JSON.stringify(item)} type={item} />
      ))}
    </TokenList>
  );
}
