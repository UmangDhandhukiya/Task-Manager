import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Box,
} from "@mui/material";

const TaskList = ({ tasks, onDelete, onEdit }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "default";
      case "in-progress":
        return "warning";
      case "complete":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Stack spacing={3} mt={4}>
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5">{task.title}</Typography>

              <Chip
                variant="outlined"
                label={task.status}
                color={getStatusColor(task.status)}
                size="small"
              />
            </Box>

            <Typography>
              {task.description}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              AssignedTo: {task.assignedTo}
            </Typography>

            <Stack direction="row" spacing={2} mt={2}>
              <Button
                variant="outlined"
                color="black"
                onClick={() => onEdit(task)}
              >
                Edit
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={() => onDelete(task.id)}
              >
                Delete
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default TaskList;
