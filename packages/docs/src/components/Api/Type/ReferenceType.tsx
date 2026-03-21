import Token from '@site/src/components/Api/Code/Token';
import TokenList, {ListType} from '@site/src/components/Api/Code/TokenList';
import Type from '@site/src/components/Api/Type';
import {getUrl, useApiLookup} from '@site/src/contexts/api';
import type {JSONOutput} from 'typedoc';

export default function ReferenceType({
  type,
}: {
  type: JSONOutput.ReferenceType;
}) {
  const lookup = useApiLookup(type.project);
  const reference = lookup?.[type.id];
  const to = type.externalUrl ?? getUrl(reference);

  return (
    <>
      <Token to={to} type={to ? 'class-name' : 'constant'} tooltip>
        {type.name}
      </Token>
      {!!type.typeArguments?.length && (
        <TokenList type={ListType.Angle}>
          {type.typeArguments.map(type => (
            <Type key={JSON.stringify(type)} type={type} />
          ))}
        </TokenList>
      )}
    </>
  );
}
