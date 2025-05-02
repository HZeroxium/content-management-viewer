import React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  Collapse,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {
  getErrorMessage,
  formatErrorForLogging,
  isValidationError,
} from "@/lib/types/error";

interface ErrorDisplayProps {
  error: unknown;
  title?: string;
  severity?: "error" | "warning" | "info" | "success";
  showDetails?: boolean;
  onRetry?: () => void;
}

/**
 * A component for displaying errors in a consistent and informative way
 */
export default function ErrorDisplay({
  error,
  title = "Error",
  severity = "error",
  showDetails = process.env.NODE_ENV === "development",
  onRetry,
}: ErrorDisplayProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (!error) return null;

  const errorMessage = getErrorMessage(error);
  const formattedError = formatErrorForLogging(error);
  const isValidation = isValidationError(error);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  // Handle array error messages for validation errors
  const renderErrorMessage = () => {
    if (Array.isArray(formattedError?.response?.error)) {
      return (
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          {formattedError.response.error.map((msg, i) => (
            <Typography component="li" variant="body2" key={i}>
              {msg}
            </Typography>
          ))}
        </Box>
      );
    }

    return <Typography variant="body2">{errorMessage}</Typography>;
  };

  return (
    <Alert
      severity={severity}
      sx={{ width: "100%", mb: 2 }}
      action={
        showDetails ? (
          <IconButton
            aria-label="show more"
            color="inherit"
            size="small"
            onClick={toggleExpanded}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        ) : undefined
      }
    >
      <AlertTitle>{isValidation ? "Validation Error" : title}</AlertTitle>

      {renderErrorMessage()}

      {onRetry && (
        <Box mt={1}>
          <Typography
            variant="body2"
            component="span"
            sx={{
              cursor: "pointer",
              textDecoration: "underline",
              color: "primary.main",
            }}
            onClick={onRetry}
          >
            Try again
          </Typography>
        </Box>
      )}

      {/* Show additional details in development mode */}
      {showDetails && (
        <Collapse in={expanded}>
          <Box mt={2} p={1} bgcolor="rgba(0,0,0,0.04)" borderRadius={1}>
            <Typography
              variant="caption"
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                fontSize: "0.7rem",
                overflowX: "auto",
              }}
            >
              {JSON.stringify(formattedError, null, 2)}
            </Typography>
          </Box>
        </Collapse>
      )}
    </Alert>
  );
}
