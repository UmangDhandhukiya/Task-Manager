import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
} from "@mui/material";

const TaskList = ({ tasks, onDelete, onEdit }) => {
  return (
    <Stack spacing={3} mt={4}>
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardContent>
            <Typography variant="h6">
              {task.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {task.description}
            </Typography>

            <Typography variant="body2">
              Assigned To: {task.assignedToEmail}
            </Typography>

            <Typography variant="body2">
              Status: {task.status}
            </Typography>

            <Stack direction="row" spacing={2} mt={2}>
              <Button
                variant="contained"
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