/**author:Sarbjeet Singh, contact:https://www.sarbzone.com*/

import { useMemo, useState } from "react";
import Alert from "@cloudscape-design/components/alert";
import AppLayout from "@cloudscape-design/components/app-layout";
import Badge from "@cloudscape-design/components/badge";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import Flashbar from "@cloudscape-design/components/flashbar";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import HelpPanel from "@cloudscape-design/components/help-panel";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import Link from "@cloudscape-design/components/link";
import SideNavigation from "@cloudscape-design/components/side-navigation";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import Textarea from "@cloudscape-design/components/textarea";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import type { SideNavigationProps } from "@cloudscape-design/components/side-navigation";
import type { TopNavigationProps } from "@cloudscape-design/components/top-navigation";
import { ModelType } from "../App";
import { translate_word_to_punjabi } from "./AiFunctions/AI_Functions";
import TransliterationStatus from "./TransliterationStatus";

const englishTokenRegex = /[a-zA-Z0-9]+/;

interface TransliterationHistoryItem {
  id: string;
  english: string;
  punjabi: string;
  translatedAt: string;
}

interface EnToPaInputProps {
  model: ModelType;
  modelLoadedAt?: string;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to transliterate the current word.";
};

const normalizeSuggestion = (word: string): string => {
  return word.replaceAll("end", "").trim();
};

const replaceLastWord = (value: string, replacement: string): string => {
  const trailingSpaceMatch = value.match(/\s+$/);
  const trailingSpace = trailingSpaceMatch ? trailingSpaceMatch[0] : " ";
  const trimmed = value.trimEnd();

  if (trimmed.length === 0) {
    return `${replacement}${trailingSpace}`;
  }

  const words = trimmed.split(/\s+/);
  words[words.length - 1] = replacement;
  return `${words.join(" ")}${trailingSpace}`;
};

const EnToPaInput: React.FC<EnToPaInputProps> = ({ model, modelLoadedAt }) => {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<TransliterationHistoryItem[]>([]);
  const [transliterationError, setTransliterationError] = useState<
    string | null
  >(null);
  const [isTranslitering, setTransliteringStatus] = useState(false);
  const [activeHref, setActiveHref] = useState("#workspace");
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);

  const translateLastWord = async (lastWord: string) => {
    setTransliteringStatus(true);
    setTransliterationError(null);

    try {
      const { word, suggestions: modelSuggestions } =
        await translate_word_to_punjabi(lastWord, model);
      const translatedWord = normalizeSuggestion(word);
      const cleanedSuggestions = modelSuggestions
        .map((suggestion) => normalizeSuggestion(suggestion))
        .filter((suggestion, index, allSuggestions) => {
          return suggestion.length > 0 && allSuggestions.indexOf(suggestion) === index;
        })
        .slice(-8);

      setSuggestions(cleanedSuggestions);
      setValue((previousValue) => replaceLastWord(previousValue, translatedWord));
      setHistory((previousHistory) => {
        const updatedHistory = [
          {
            id: `${Date.now()}-${lastWord}`,
            english: lastWord,
            punjabi: translatedWord,
            translatedAt: new Date().toLocaleTimeString(),
          },
          ...previousHistory,
        ];
        return updatedHistory.slice(0, 15);
      });
    } catch (error) {
      setTransliterationError(getErrorMessage(error));
    } finally {
      setTransliteringStatus(false);
    }
  };

  const onChangeHandler = (text: string) => {
    if (isTranslitering) {
      return;
    }

    setValue(text);

    if (!text.endsWith(" ")) {
      return;
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      return;
    }

    const tokens = trimmedText.split(/\s+/);
    const lastWord = tokens[tokens.length - 1];

    if (!englishTokenRegex.test(lastWord)) {
      return;
    }

    void translateLastWord(lastWord);
  };

  const replaceBySuggestion = (suggestion: string) => {
    setValue((previousValue) => replaceLastWord(previousValue, suggestion));
  };

  const clearEditor = () => {
    setValue("");
    setSuggestions([]);
    setTransliterationError(null);
  };

  const sessionMetrics = useMemo(() => {
    const words = value.trim().length > 0 ? value.trim().split(/\s+/).length : 0;
    return {
      characters: value.length,
      words,
      suggestions: suggestions.length,
      history: history.length,
    };
  }, [history.length, suggestions.length, value]);

  const suggestionRows = useMemo(() => {
    return suggestions.map((suggestion, index) => {
      return {
        id: `suggestion-${index}`,
        suggestion,
      };
    });
  }, [suggestions]);

  const onSideNavigationFollow: SideNavigationProps["onFollow"] = (event) => {
    const { href } = event.detail;
    if (!href) {
      return;
    }

    if (href.startsWith("#")) {
      event.preventDefault();
      setActiveHref(href);
      const sectionId = href.replace("#", "");
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const onTopNavigationFollow: NonNullable<
    TopNavigationProps["identity"]["onFollow"]
  > = (event) => {
    event.preventDefault();
    setActiveHref("#overview");
    const overview = document.getElementById("overview");
    if (overview) {
      overview.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const flashItems = [
    {
      id: "model-status",
      type: "success" as const,
      dismissible: false,
      content: modelLoadedAt
        ? `Model loaded on ${modelLoadedAt} and ready for inference.`
        : "Model ready for inference.",
    },
    {
      id: "usage-help",
      type: transliterationError ? ("error" as const) : ("info" as const),
      dismissible: false,
      content: transliterationError
        ? transliterationError
        : "Type English text and press space to transliterate the current word.",
    },
  ];

  const content = (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="English to Punjabi transliteration powered by TensorFlow.js and AWS Cloudscape."
          info={
            <Link href="https://cloudscape.design/components/" external>
              Cloudscape components
            </Link>
          }
          actions={
            <StatusIndicator
              type={isTranslitering ? "in-progress" : "success"}
            >
              {isTranslitering ? "Transliterating" : "Ready"}
            </StatusIndicator>
          }
        >
          Punjabi Transliteration Studio
        </Header>
      }
    >
      <SpaceBetween size="l">
        <section id="overview">
          <Container
            header={
              <Header
                variant="h2"
                description="Real-time session signals for current transliteration activity."
              >
                Session Overview
              </Header>
            }
          >
            <KeyValuePairs
              columns={4}
              items={[
                { label: "Characters", value: sessionMetrics.characters },
                { label: "Words", value: sessionMetrics.words },
                { label: "Suggestions", value: sessionMetrics.suggestions },
                { label: "History Entries", value: sessionMetrics.history },
              ]}
            />
          </Container>
        </section>

        <section id="workspace">
          <Container
            header={
              <Header
                variant="h2"
                description="Write in English. Press space to transliterate the latest word."
                actions={
                  <Button variant="normal" onClick={clearEditor}>
                    Clear text
                  </Button>
                }
              >
                Transliteration Workspace
              </Header>
            }
          >
            <SpaceBetween size="m">
              <FormField
                label="Input text"
                description="The app transliterates only after you press space."
              >
                <Textarea
                  value={value}
                  placeholder="Start typing in English..."
                  spellcheck={false}
                  rows={10}
                  onChange={({ detail }) => {
                    onChangeHandler(detail.value);
                  }}
                />
              </FormField>

              {isTranslitering && <TransliterationStatus />}
            </SpaceBetween>
          </Container>
        </section>

        <section id="suggestions">
          <Container
            header={
              <Header
                variant="h2"
                counter={`(${suggestions.length})`}
                description="Model-generated alternatives for the latest transliterated word."
              >
                Suggestions
              </Header>
            }
          >
            {suggestionRows.length === 0 ? (
              <Alert type="info">
                Suggestions appear after a word is transliterated.
              </Alert>
            ) : (
              <Table
                variant="embedded"
                columnDefinitions={[
                  {
                    id: "suggestion",
                    header: "Punjabi suggestion",
                    cell: (item) => item.suggestion,
                  },
                  {
                    id: "action",
                    header: "Action",
                    cell: (item) => (
                      <Button
                        variant="inline-link"
                        onClick={() => {
                          replaceBySuggestion(item.suggestion);
                        }}
                      >
                        Apply suggestion
                      </Button>
                    ),
                  },
                ]}
                items={suggestionRows}
                trackBy="id"
                loadingText="Loading suggestions"
                empty={
                  <Box color="text-body-secondary" textAlign="center">
                    No suggestions available.
                  </Box>
                }
              />
            )}
          </Container>
        </section>

        <section id="history">
          <Container
            header={
              <Header
                variant="h2"
                description="Latest transliteration operations in this browser session."
                actions={<Badge color="blue">{history.length} entries</Badge>}
              >
                Recent History
              </Header>
            }
          >
            <Table
              variant="embedded"
              columnDefinitions={[
                {
                  id: "english",
                  header: "English",
                  cell: (item) => item.english,
                },
                {
                  id: "punjabi",
                  header: "Punjabi",
                  cell: (item) => item.punjabi,
                },
                {
                  id: "time",
                  header: "Translated at",
                  cell: (item) => item.translatedAt,
                },
              ]}
              items={history}
              trackBy="id"
              empty={
                <Box color="text-body-secondary" textAlign="center">
                  History will appear after the first transliteration.
                </Box>
              }
            />
          </Container>
        </section>

        <ExpandableSection headerText="Usage Notes">
          <ColumnLayout columns={2} borders="vertical">
            <Box>
              This UI is built with Cloudscape layout and data-display
              components to provide production-ready structure.
            </Box>
            <Box>
              Transliteration runs on the client using TensorFlow.js and the
              model files packaged with this app.
            </Box>
          </ColumnLayout>
        </ExpandableSection>
      </SpaceBetween>
    </ContentLayout>
  );

  return (
    <>
      <TopNavigation
        identity={{
          title: "Punjabi Transliteration Studio",
          href: "#overview",
          onFollow: onTopNavigationFollow,
        }}
        utilities={[
          {
            type: "button",
            text: "Clear",
            ariaLabel: "Clear transliteration editor",
            onClick: clearEditor,
          },
        ]}
        i18nStrings={{
          overflowMenuTitleText: "More",
          overflowMenuTriggerText: "More",
        }}
      />
      <AppLayout
        ariaLabels={{
          navigation: "Side navigation",
          navigationToggle: "Open navigation panel",
          navigationClose: "Close navigation panel",
          notifications: "Status notifications",
          tools: "Help panel",
          toolsToggle: "Open help panel",
          toolsClose: "Close help panel",
        }}
        contentType="form"
        navigationOpen={navigationOpen}
        onNavigationChange={({ detail }) => {
          setNavigationOpen(detail.open);
        }}
        toolsOpen={toolsOpen}
        onToolsChange={({ detail }) => {
          setToolsOpen(detail.open);
        }}
        navigation={
          <SideNavigation
            activeHref={activeHref}
            header={{ href: "#overview", text: "Punjabi Model" }}
            onFollow={onSideNavigationFollow}
            items={[
              {
                type: "section",
                text: "Workspace",
                items: [
                  {
                    type: "link",
                    href: "#overview",
                    text: "Session overview",
                    info: <Badge color="green">Live</Badge>,
                  },
                  { type: "link", href: "#workspace", text: "Editor" },
                  { type: "link", href: "#suggestions", text: "Suggestions" },
                  { type: "link", href: "#history", text: "History" },
                ],
              },
              { type: "divider" },
              {
                type: "link",
                href: "https://cloudscape.design/components/",
                text: "Cloudscape Docs",
                external: true,
              },
            ]}
          />
        }
        notifications={<Flashbar items={flashItems} />}
        tools={
          <HelpPanel header={<h2>How to use this UI</h2>}>
            <Box variant="p">
              Enter English text in the editor and press space to transliterate
              the latest word into Punjabi.
            </Box>
            <Box variant="h3">Professional layout elements</Box>
            <ul>
              <li>Application shell with top and side navigation</li>
              <li>Structured forms, alerts, flash messages, and status states</li>
              <li>Data display for suggestions and transliteration history</li>
            </ul>
            <Box variant="h3">Model behavior</Box>
            <Box variant="p">
              The translation model and token shards are loaded from the app
              public assets at startup.
            </Box>
          </HelpPanel>
        }
        content={content}
      />
    </>
  );
};

export default EnToPaInput;
