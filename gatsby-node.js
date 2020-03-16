import { home } from './src/build/home';
import { articles } from './src/build/articles';

export async function createPages ({ graphql, actions, reporter }) {
  await Promise.all(
    [
      home(graphql, actions, reporter),
      articles(graphql, actions, reporter),
    ],
  );
}
