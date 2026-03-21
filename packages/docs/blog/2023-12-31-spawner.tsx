view.add(
  // before
  <Node spawner={() => range(count()).map(i => <Node key={i} />)} />,
);

view.add(
  // after
  <Node>{() => range(count()).map(i => <Node key={i} />)}</Node>,
);
