function getChipColor(key) {
  const chipColorMap = {
    urgent: "error",
    high: "warning",
    medium: "success",
    low: "info",
    active: "info",
    on_hold: "warning",
    completed: "success",
    cancelled: "error",
    planning: "primary",
    "in-progress": "success",
    paused: "warning",
    done: "info"
  };

  return chipColorMap[key];
};

export default getChipColor;