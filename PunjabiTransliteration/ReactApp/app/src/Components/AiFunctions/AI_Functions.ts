import { ModelType } from "../../App";
import {
  english_tokenizer,
  punjabi_decoder,
  punjabi_tokens,
  sequence_padder,
} from "./AI_Assets/VocabTokens";
import * as tf from "@tensorflow/tfjs";

export const translate_word_to_punjabi = async (
  word: string,
  model: ModelType
) => {
  let output: number[] = [];

  
    const enconder_input = english_tokenizer(word, 50);
    let decoding_tokens = [punjabi_tokens.indexOf("start")];
    let decoder_input = sequence_padder(decoding_tokens, 50);

    const X = tf.expandDims(tf.cast(enconder_input, "int32"), 0);

    for (let index = 0; index < 50; index++) {
      const y = tf.expandDims(tf.cast(decoder_input, "int32"), 0);

      const prediction = model!.predict([X, y]) as tf.Tensor<tf.Rank>;
      const pred_argmax = prediction.argMax(-1);
      const predToArray = await pred_argmax.data();

      const pred_token =  predToArray[index];
      output = [...output, pred_token];
      decoding_tokens = [...decoding_tokens, pred_token];
      decoder_input = sequence_padder(decoding_tokens, 50);

      if (punjabi_tokens[pred_token] === "end") {
        break;
      }
    }
  
    const top_5_char_pairs = await top_5_words(word, model);

  const top_5_suggestions = generateWordCombinations(
    top_5_char_pairs
  ).slice(-5);

  return {
    word: punjabi_decoder(output).replace("end", ""),
    suggestions: top_5_suggestions,
  };
};

function generateWordCombinations(sublists: string[][]): string[] {
  function helper(currentIndex: number, currentWord: string): string[] {
    if (currentIndex === sublists.length) {
      return [currentWord];
    }

    const words: string[] = [];
    for (const letter of sublists[currentIndex]) {
      words.push(...helper(currentIndex + 1, currentWord + letter));
    }
    return words;
  }

  return helper(0, "");
}

async function top_5_words(text: string, model: tf.LayersModel): Promise<string[][]> {
  let decoderInput: string = "start";

  const textTensor = english_tokenizer(text, 50);
  const textTensorCasted = tf.cast(textTensor, "int32");
  const textExpanded = textTensorCasted.expandDims(0);
  const letters: string[][] = [];

  for (let x = 0; x < 30; x++) {
    const decoderTokens = sequence_padder(
      decoderInput.split(" ").map((i) => punjabi_tokens.indexOf(i)),
      50
    );
    const decoderTokensCasted = tf.cast(decoderTokens, "int32");
    const decoderTokensExpanded = decoderTokensCasted.expandDims(0);

    const prediction: any = model.predict([
      textExpanded,
      decoderTokensExpanded,
    ]) as tf.Tensor<tf.Rank>;

    const predToArray = await prediction.array();

    const predictionArray = predToArray[0][x] as number[];
    const sortedArray = [...predictionArray].sort((a, b) => a - b);
    const topIndexes = sortedArray
      .slice(-2, 100)
      .map((i) => predictionArray.indexOf(i));

    const topLetters = topIndexes.map((i) => punjabi_decoder([i]));
    letters.push(topLetters);
    tf.dispose([prediction, decoderTokensCasted, decoderTokensExpanded]);
    //print(topLetters)
    const predText = topLetters[topLetters.length - 1];

    if (predText === "end") {
      break;
    }
    decoderInput += ` ${predText}`;
  }

  tf.dispose([textTensorCasted, textExpanded]);

  return letters;
}
