import { sequence_padder } from "./Components/AiFunctions/AI_Assets/VocabTokens";

test("pads token sequence to expected size", () => {
  const padded = sequence_padder([1, 2, 3], 50);
  expect(padded).toHaveLength(50);
  expect(padded[0]).toBe(1);
  expect(padded[1]).toBe(2);
  expect(padded[2]).toBe(3);
});
