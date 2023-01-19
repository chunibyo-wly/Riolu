export function getAllSolutions(baseNumberList, amount) {
  const result = [];

  function dfs(currentAmount, currentSolution) {
    if (0 == currentAmount) {
      result.push([...currentSolution]);
    } else {
      for (let i = 0; i < baseNumberList.length; ++i) {
        const tmp = baseNumberList[i];
        if (tmp > currentAmount) break;

        currentSolution.push(tmp);
        dfs(currentAmount - tmp, currentSolution);
        currentSolution.pop();
      }
    }
  }

  baseNumberList.sort();
  dfs(amount, []);
  return result;
}
