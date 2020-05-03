import { isValidElement } from '../../_util/props-util';

function convertNodeToOption(node) {
  const {
    key,
    props: { children, value, ...restProps },
  } = node;

  return { key, value: value !== undefined ? value : key, children, ...restProps };
}

export function convertChildrenToData(nodes, optionOnly) {
  return Array.isArray(nodes)
    ? nodes
    : [nodes]
        .map((node, index) => {
          if (!isValidElement(node) || !node.type) {
            return null;
          }

          const {
            type: { isSelectOptGroup },
            key,
            props: { children, ...restProps },
          } = node;

          if (optionOnly || !isSelectOptGroup) {
            return convertNodeToOption(node);
          }

          return {
            key: `__VC_SELECT_GRP__${key === null ? index : key}__`,
            label: key,
            ...restProps,
            options: convertChildrenToData(children),
          };
        })
        .filter(data => data);
}
