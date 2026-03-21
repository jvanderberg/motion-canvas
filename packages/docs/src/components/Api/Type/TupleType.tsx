import TokenList, {ListType} from '@site/src/components/Api/Code/TokenList';
import Type from '@site/src/components/Api/Type';
import type {JSONOutput} from 'typedoc';

export default function TupleType({type}: {type: JSONOutput.TupleType}) {
  return type.elements ? (
    <TokenList type={ListType.Square}>
      {type.elements.map(type => (
        <Type key={JSON.stringify(type)} type={type} />
      ))}
    </TokenList>
  ) : (
    <>[]</>
  );
}
