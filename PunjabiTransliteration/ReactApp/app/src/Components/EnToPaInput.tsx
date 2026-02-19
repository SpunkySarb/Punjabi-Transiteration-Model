/**author:Sarbjeet Singh, contact:https://www.sarbzone.com*/

import { ModelType } from "../App";
import { useState, useRef, useCallback } from "react";
import { translate_word_to_punjabi } from "./AiFunctions/AI_Functions";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Alert from "@cloudscape-design/components/alert";
import Grid from "@cloudscape-design/components/grid";
import Container from "@cloudscape-design/components/container";
import FormField from "@cloudscape-design/components/form-field";
import Textarea from "@cloudscape-design/components/textarea";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import ColumnLayout from "@cloudscape-design/components/column-layout";

const englishRegex = /[a-zA-Z0-9]+/;

interface WordPair {
  en: string;
  pa: string;
}

const EnToPaInput: React.FC<{ model: ModelType }> = ({ model }) => {
  const [inputValue, setInputValue] = useState("");
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lastTranslatedIndex, setLastTranslatedIndex] = useState(-1);
  const [translatingCount, setTranslatingCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const wordPairsRef = useRef<WordPair[]>([]);
  const cacheRef = useRef<Map<string, { word: string; suggestions: string[] }>>(
    new Map()
  );
  const versionRef = useRef<Map<number, number>>(new Map());

  const translateWord = useCallback(
    async (englishWord: string, index: number) => {
      const key = englishWord.toLowerCase();

      // Bump version for this word position — stale results will be ignored
      const version = (versionRef.current.get(index) ?? 0) + 1;
      versionRef.current.set(index, version);

      // Cache hit — apply immediately, no async work
      const cached = cacheRef.current.get(key);
      if (cached) {
        if (versionRef.current.get(index) !== version) return;
        setWordPairs((prev) => {
          const updated = [...prev];
          while (updated.length <= index) updated.push({ en: "", pa: "" });
          updated[index] = { en: key, pa: cached.word };
          wordPairsRef.current = updated;
          return updated;
        });
        setSuggestions(cached.suggestions);
        setLastTranslatedIndex(index);
        return;
      }

      setTranslatingCount((c) => c + 1);
      try {
        const { word, suggestions } = await translate_word_to_punjabi(
          englishWord,
          model
        );

        // Cache for future reuse
        cacheRef.current.set(key, { word, suggestions });

        // Only apply if this is still the latest request for this position
        if (versionRef.current.get(index) !== version) return;

        setWordPairs((prev) => {
          const updated = [...prev];
          while (updated.length <= index) updated.push({ en: "", pa: "" });
          updated[index] = { en: key, pa: word };
          wordPairsRef.current = updated;
          return updated;
        });
        setSuggestions(suggestions);
        setLastTranslatedIndex(index);
      } catch (err: any) {
        console.log(err.message);
      } finally {
        setTranslatingCount((c) => c - 1);
      }
    },
    [model]
  );

  const onChangeHandler = (text: string) => {
    setInputValue(text);

    // Only trigger translation when the user presses spacebar (text ends with space)
    if (!text.endsWith(" ") || text.trim().length === 0) return;

    const words = text.trim().split(/\s+/);
    const currentPairs = wordPairsRef.current;

    words.forEach((word, index) => {
      if (!englishRegex.test(word)) return;

      // Skip if this position already has the same word translated
      if (
        index < currentPairs.length &&
        currentPairs[index].en === word.toLowerCase()
      )
        return;

      translateWord(word, index);
    });

    // If words were deleted, trim the mapping
    if (words.length < currentPairs.length) {
      const trimmed = currentPairs.slice(0, words.length);
      wordPairsRef.current = trimmed;
      setWordPairs(trimmed);
    }
  };

  const outputValue = wordPairs.map((p) => p.pa).join(" ");

  const replaceBySuggestion = (suggestion: string) => {
    if (lastTranslatedIndex < 0) return;
    setWordPairs((prev) => {
      if (lastTranslatedIndex >= prev.length) return prev;
      const updated = [...prev];
      updated[lastTranslatedIndex] = {
        ...updated[lastTranslatedIndex],
        pa: suggestion,
      };
      wordPairsRef.current = updated;
      return updated;
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputValue.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <ContentLayout
      header={<Header variant="h1">Punjabi Transliteration Model</Header>}
    >
      <SpaceBetween size="l">
        <Alert type="info">
          Type text in English and press <strong>SpaceBar</strong> to convert
          each word to Punjabi. Edit any word and press space again to update
          its translation. Click a suggestion to replace the last translated
          word.
        </Alert>

        <Grid
          gridDefinition={[
            { colspan: { default: 12, m: 6 } },
            { colspan: { default: 12, m: 6 } },
          ]}
        >
          <Container header={<Header variant="h2">English Input</Header>}>
            <FormField description="Type English text and press spacebar to transliterate">
              <Textarea
                placeholder="Start writing here..."
                value={inputValue}
                onChange={({ detail }) => onChangeHandler(detail.value)}
                rows={10}
                spellcheck={false}
                autoFocus
              />
            </FormField>
            {translatingCount > 0 && (
              <Box padding={{ top: "s" }}>
                <StatusIndicator type="loading">
                  Transliterating...
                </StatusIndicator>
              </Box>
            )}
          </Container>

          <Container
            header={
              <Header
                variant="h2"
                actions={
                  <Button
                    iconName={copied ? "status-positive" : "copy"}
                    variant="icon"
                    onClick={copyToClipboard}
                    ariaLabel="Copy Punjabi text"
                  />
                }
              >
                Punjabi Output
              </Header>
            }
          >
            <Box fontSize="display-l" padding="s">
              {outputValue.trim() || (
                <Box color="text-status-inactive">
                  Punjabi text will appear here...
                </Box>
              )}
            </Box>
          </Container>
        </Grid>

        <ExpandableSection headerText="About This Model" variant="footer">
          <ColumnLayout columns={2}>
            <SpaceBetween size="xs">
              <Box variant="h4">How It Works</Box>
              <Box variant="p">
                This model runs <strong>entirely in your browser</strong> using
                TensorFlow.js — no data is sent to any server. The neural
                network is loaded into your device's memory and all
                transliteration happens on your CPU, which is why it may feel
                slow on older devices.
              </Box>
            </SpaceBetween>
            <SpaceBetween size="xs">
              <Box variant="h4">Model Details</Box>
              <Box variant="p">
                Encoder-Decoder LSTM architecture with ~8M parameters (30 MB).
                Character-level tokenization with a 28-token English vocabulary
                and 61-token Punjabi vocabulary. Trained on 514,000+ word pairs
                from the Dakshina dataset with early stopping.
              </Box>
            </SpaceBetween>
          </ColumnLayout>
        </ExpandableSection>

        {suggestions.length > 0 && (
          <Container header={<Header variant="h2">Suggestions</Header>}>
            <SpaceBetween direction="horizontal" size="s">
              {suggestions.map((i, index) => (
                <Button
                  key={index}
                  variant="normal"
                  onClick={() =>
                    replaceBySuggestion(i.replaceAll("end", ""))
                  }
                >
                  {i.replaceAll("end", "")}
                </Button>
              ))}
            </SpaceBetween>
          </Container>
        )}
      </SpaceBetween>
    </ContentLayout>
  );
};

export default EnToPaInput;
