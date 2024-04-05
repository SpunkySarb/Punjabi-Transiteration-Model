/**author:Sarbjeet Singh, contact:https://www.sarbzone.com*/

import TextArea from "antd/es/input/TextArea";
import { ModelType } from "../App";
import { useState } from "react";
import { Tag } from "antd";
import { translate_word_to_punjabi } from "./AiFunctions/AI_Functions";
import TransliterationStatus from "./TransliterationStatus";

const regex = /[a-zA-Z0-9]+/;

const EnToPaInput: React.FC<{ model: ModelType }> = ({ model }) => {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTranslitering, setTransliteringStatus] = useState(false);

  const translate_last_word = async (lastWord: string) => {
    setTransliteringStatus(true);
    const { word, suggestions } = await translate_word_to_punjabi(
      lastWord,
      model
    );

    setSuggestions(suggestions);
    setTransliteringStatus(false);
    return word;
  };

  const onChangeHandler = (text: string) => {
    if (regex.test(text)) {
      if (text.split("").reverse()[0] === " ") {
        const last_word = text.split(" ").reverse()[1];
        translate_last_word(last_word)
          .then((word) => {
            setValue((prev) => {
              const filtered =
                prev
                  .split("")
                  .filter((i) => !regex.test(i))
                  .join("") +
                word +
                " ";

              return filtered;
            });
          })
          .catch((err: any) => {
            console.log(err.message);
          });
      }
    }
  };
  const replace_by_suggestion = (suggestion: string) => {
    setValue((prev) => {
      const text_array = prev.split(" ");
      let last_index = 1;
      if (text_array[text_array.length - last_index].trim() === "") {
        last_index = 2;
      }
      const result =
        text_array.slice(0, text_array.length - last_index).join(" ") +
        suggestion +
        " ";

      return result;
    });
  };

  return (
    <div style={{ maxWidth: window.innerWidth }}>
      <div
        style={{
          fontFamily: "Anton",
          fontSize: 25,
          color: "white",
          padding: 10,
          textAlign: "center",
          backgroundColor: "black",
        }}
      >
        Punjabi Transliteration Model
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 20,
          marginBottom: 5,
          fontFamily: "monospace",
          fontSize: 20,
        }}
      >
        Write text in english and press SpaceBar to convert to Punjabi
      </div>
      {isTranslitering && <TransliterationStatus/>}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems:'center'
        }}
      >
        <TextArea
          placeholder="Start Writing here.."
          value={value}
          
          autoFocus
          spellCheck={false}
          onChange={(e) => {
            if(!isTranslitering){
                onChangeHandler(e.target.value);
                setValue(e.target.value);
            }
            
          }}
          style={{
            padding: 10,
            fontSize: 20,
            margin: 20,
            maxWidth:1000,
            minHeight:300
          }}
        />
        {suggestions.length > 0 && (
          <div>
            {suggestions.map((i, index) => (
              <Tag
              style={{fontSize:20, padding:10, minWidth:100, textAlign:'center'}}
                onClick={() => {
                  replace_by_suggestion(i.replaceAll("end", ""));
                }}
                key={index}
              >
                {i.replaceAll("end", "")}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default EnToPaInput;
