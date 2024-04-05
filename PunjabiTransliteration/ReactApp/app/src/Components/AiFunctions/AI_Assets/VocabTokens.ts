export const english_tokens = [
  "",
  "[UNK]",
  "a",
  "i",
  "n",
  "r",
  "e",
  "h",
  "t",
  "s",
  "o",
  "l",
  "d",
  "u",
  "k",
  "m",
  "p",
  "g",
  "c",
  "b",
  "v",
  "j",
  "y",
  "f",
  "w",
  "z",
  "x",
  "q",
];

export const punjabi_tokens = [
  "",
  "[UNK]",
  "start",
  "end",
  "ਾ",
  "ਰ",
  "ਸ",
  "ੀ",
  "ਿ",
  "ਲ",
  "ਕ",
  "ਨ",
  "ੋ",
  "ਮ",
  "ੇ",
  "ਟ",
  "ਪ",
  "ਵ",
  "ਂ",
  "ਗ",
  "ਜ",
  "ਬ",
  "ਤ",
  "ੁ",
  "ਦ",
  "ੈ",
  "ੰ",
  "਼",
  "ਆ",
  "ਡ",
  "ਹ",
  "ੱ",
  "੍",
  "ਅ",
  "ਫ",
  "ੂ",
  "ਚ",
  "ਈ",
  "ਇ",
  "ਖ",
  "ਐ",
  "ਣ",
  "ੌ",
  "ਉ",
  "ੜ",
  "ਧ",
  "ਥ",
  "ਭ",
  "ਓ",
  "ਯ",
  "ਏ",
  "ਘ",
  "ਛ",
  "ਊ",
  "ਝ",
  "ਠ",
  "ਢ",
  "ਔ",
  "ਞ",
  "ਙ",
  "ੲ",
];

export const sequence_padder = (sequence:number[], padding:number)=>{

    const pad_token = 0;

    if(sequence.length>50){
        return sequence.filter((i,index)=>index < 50)
    }else{

        const padded_sequence = sequence.map(i=>i);

        for (let index = padded_sequence.length; index <50; index++) {
            padded_sequence.push(pad_token)
            
        }

        return padded_sequence;

    }


}


export const english_tokenizer = (word: string, padding: number) => {
  const letters = word.toLowerCase().split("");

  const tokenized_word = letters.map((i) => {
    for (let index = 0; index < english_tokens.length; index++) {
      if (i === english_tokens[index]) {
        return index;
        break;
      }
    }
  });

  const padded_sequnce = sequence_padder(tokenized_word as number[], padding);

  return padded_sequnce;
};



export const punjabi_decoder = (sequence:number[]) => {
    
    const word = sequence.map(i=>{

        return punjabi_tokens[i]

    });

    return word.join("");


  };
