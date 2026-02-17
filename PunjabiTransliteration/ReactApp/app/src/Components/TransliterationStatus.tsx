/**author:Sarbjeet Singh, contact:https://www.sarbzone.com*/

import Box from "@cloudscape-design/components/box";
import Spinner from "@cloudscape-design/components/spinner";
import StatusIndicator from "@cloudscape-design/components/status-indicator";

const TransliterationStatus: React.FC = () => {
  return (
    <Box>
      <Spinner size="normal" />
      <Box padding={{ top: "xxs" }}>
        <StatusIndicator type="in-progress">
          Transliteration in progress
        </StatusIndicator>
      </Box>
    </Box>
  );
};
export default TransliterationStatus;
