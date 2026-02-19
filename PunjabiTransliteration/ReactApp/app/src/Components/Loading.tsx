/**author:Sarbjeet Singh, contact:https://www.sarbzone.com*/

import Box from "@cloudscape-design/components/box";
import Spinner from "@cloudscape-design/components/spinner";
import StatusIndicator from "@cloudscape-design/components/status-indicator";

const Loading: React.FC = () => {
  return (
    <Box textAlign="center" padding={{ vertical: "xxxl" }}>
      <Box padding={{ bottom: "l" }}>
        <Spinner size="large" />
      </Box>
      <Box padding={{ bottom: "s" }}>
        <StatusIndicator type="loading">Loading Model</StatusIndicator>
      </Box>
      <Box variant="small" color="text-body-secondary">
        Developed by SarbZone
      </Box>
    </Box>
  );
};

export default Loading;
