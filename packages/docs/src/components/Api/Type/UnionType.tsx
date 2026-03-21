import TokenList, {
  ListType,
  Separator,
} from '@site/src/components/Api/Code/TokenList';
import Type from '@site/src/components/Api/Type';
import type {JSONOutput} from 'typedoc';

export default function UnionType({type}: {type: JSONOutput.UnionType}) {
  return (
    <TokenList type={ListType.Parentheses} separator={Separator.Pipe}>
      {type.types.map(item => (
        <Type key={JSON.stringify(item)} type={item} />
      ))}
    </TokenList>
  );
}
