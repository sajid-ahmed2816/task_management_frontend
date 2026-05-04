import React, { Fragment, useState } from 'react';
import { Box, Button, Grid, Typography, LinearProgress, AvatarGroup, Avatar } from '@mui/material';
import { CircleOutlined, ChangeHistoryRounded, StarBorderRounded, MessageOutlined, AttachFileOutlined } from '@mui/icons-material';

const tasks = [
  {
    title: "Redesign Landing Page",
    category: "UI/UX Design",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus laboriosam nihil, praesentium et quae rerum eaque tempore.",
    comments: [
      {
        name: "John Doe",
        comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore sit delectus aperiam harum pariatur possimus incidunt, obcaecati"
      },
      {
        name: "John Doe",
        comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore sit delectus aperiam harum pariatur possimus incidunt, obcaecati"
      },
      {
        name: "John Doe",
        comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore sit delectus aperiam harum pariatur possimus incidunt, obcaecati"
      },
    ],
    attachments: [
      "file1",
      "file2"
    ],
    assignees: [
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
    ]
  },
  {
    title: "Redesign Landing Page",
    category: "UI/UX Design",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus laboriosam nihil, praesentium et quae rerum eaque tempore.",
    comments: [
      {
        name: "John Doe",
        comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore sit delectus aperiam harum pariatur possimus incidunt, obcaecati"
      },
      {
        name: "John Doe",
        comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore sit delectus aperiam harum pariatur possimus incidunt, obcaecati"
      },
      {
        name: "John Doe",
        comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore sit delectus aperiam harum pariatur possimus incidunt, obcaecati"
      },
    ],
    attachments: [
      "file1",
      "file2"
    ],
    assignees: [
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
    ]
  },
  {
    title: "Redesign Landing Page",
    category: "UI/UX Design",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus laboriosam nihil, praesentium et quae rerum eaque tempore.",
    comments: [
      {
        name: "John Doe",
        comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore sit delectus aperiam harum pariatur possimus incidunt, obcaecati"
      },
      {
        name: "John Doe",
        comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore sit delectus aperiam harum pariatur possimus incidunt, obcaecati"
      },
      {
        name: "John Doe",
        comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore sit delectus aperiam harum pariatur possimus incidunt, obcaecati"
      },
    ],
    attachments: [
      "file1",
      "file2"
    ],
    assignees: [
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
      {
        name: "person 1",
        profile_pircture: "url/path/name.ext"
      },
    ]
  },
]

function Tasks() {
  const [progress, setProgress] = useState(20);
  return (
    <Fragment>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography
            variant={"h1"}
            sx={{
              fontSize: "24px",
              fontWeight: 600
            }}
          >
            Tasks
          </Typography>
        </Grid>
        <Grid size={12}>
          <Grid
            container
            spacing={2}
          >
            <Grid size={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2
                }}
              >
                <Box sx={{ px: 1 }}>
                  <Typography
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    <Box
                      component={"span"}
                      sx={{
                        lineHeight: 0
                      }}
                    >
                      <CircleOutlined sx={{ width: "18px", height: "18px" }} />
                    </Box>
                    <Box
                      component={"span"}
                      sx={{
                        lineHeight: 1
                      }}
                    >
                      In Progress
                    </Box>
                  </Typography>
                </Box>
                <Box sx={{ px: 1 }}>
                  <Button
                    variant='contained'
                    fullWidth={true}
                    sx={{
                      borderRadius: "12px"
                    }}
                  >
                    +
                  </Button>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    borderRadius: "12px",
                    height: "calc(100vh - 180px)",
                    overflowY: "auto",
                    padding: 1
                  }}
                >
                  {tasks.map((item, i) => (
                    <Box
                      sx={{
                        background: "#E4E4EE",
                        padding: 2,
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        boxShadow: "0px 0px 4px 1px #80808050"
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        <Typography
                          variant={"body1"}
                          sx={{ fontWeight: 600 }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant={"body2"}
                          sx={{ color: (theme) => theme.palette.primary.main }}
                        >
                          {item.category}
                        </Typography>
                      </Box>
                      <Typography
                        variant={"caption"}
                        sx={{
                          color: "#808080",
                          fontWeight: 500,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word', // optional, helps with long words
                        }}
                      >
                        {item.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1
                            }}
                          >
                            <MessageOutlined sx={{ width: "18px", height: "18px" }} />
                            <Typography>4</Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1
                            }}
                          >
                            <Box
                              sx={{
                                transform: "rotate(45deg)",
                                display: "flex"
                              }}
                            >
                              <AttachFileOutlined sx={{ width: "18px", height: "18px" }} />
                            </Box>
                            <Typography>4</Typography>
                          </Box>
                        </Box>
                        <AvatarGroup
                          total={item.assignees.length}
                          slotProps={{
                            surplus: {
                              sx: {
                                width: "24px", height: "24px", fontSize: "12px"
                              }
                            }
                          }}
                        >
                          {item.assignees.slice(0, 2).map(assignee => (
                            <Avatar alt={assignee.name} sx={{ width: "24px", height: "24px" }} />
                          ))}
                        </AvatarGroup>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1
                        }}
                      >
                        <Typography variant={"body2"}>{`${progress}%`}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          aria-label="Export data"
                          sx={{
                            width: "100%",
                            borderRadius: 8,
                          }}
                        />
                        <Typography variant={"body2"}>{"1/5"}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
            <Grid size={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2
                }}
              >
                <Box sx={{ px: 1 }}>
                  <Typography
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    <Box
                      component={"span"}
                      sx={{
                        lineHeight: 0
                      }}
                    >
                      <ChangeHistoryRounded sx={{ width: "20px", height: "20px" }} />
                    </Box>
                    <Box
                      component={"span"}
                      sx={{
                        lineHeight: 1
                      }}
                    >
                      Paused
                    </Box>
                  </Typography>
                </Box>
                <Box sx={{ px: 1 }}>
                  <Button
                    variant='contained'
                    fullWidth={true}
                    sx={{
                      borderRadius: "12px"
                    }}
                  >
                    +
                  </Button>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    borderRadius: "12px",
                    height: "calc(100vh - 180px)",
                    overflowY: "auto",
                    padding: 1
                  }}
                >
                  {tasks.map((item, i) => (
                    <Box
                      sx={{
                        background: "#E4E4EE",
                        padding: 2,
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        boxShadow: "0px 0px 4px 1px #80808050"
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        <Typography
                          variant={"body1"}
                          sx={{ fontWeight: 600 }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant={"body2"}
                          sx={{ color: (theme) => theme.palette.primary.main }}
                        >
                          {item.category}
                        </Typography>
                      </Box>
                      <Typography
                        variant={"caption"}
                        sx={{
                          color: "#808080",
                          fontWeight: 500,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word', // optional, helps with long words
                        }}
                      >
                        {item.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1
                            }}
                          >
                            <MessageOutlined sx={{ width: "18px", height: "18px" }} />
                            <Typography>4</Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1
                            }}
                          >
                            <Box
                              sx={{
                                transform: "rotate(45deg)",
                                display: "flex"
                              }}
                            >
                              <AttachFileOutlined sx={{ width: "18px", height: "18px" }} />
                            </Box>
                            <Typography>4</Typography>
                          </Box>
                        </Box>
                        <AvatarGroup
                          total={item.assignees.length}
                          slotProps={{
                            surplus: {
                              sx: {
                                width: "24px", height: "24px", fontSize: "12px"
                              }
                            }
                          }}
                        >
                          {item.assignees.slice(0, 2).map(assignee => (
                            <Avatar alt={assignee.name} sx={{ width: "24px", height: "24px" }} />
                          ))}
                        </AvatarGroup>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1
                        }}
                      >
                        <Typography variant={"body2"}>{`${progress}%`}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          aria-label="Export data"
                          sx={{
                            width: "100%",
                            borderRadius: 8,
                          }}
                        />
                        <Typography variant={"body2"}>{"1/5"}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
            <Grid size={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2
                }}
              >
                <Box sx={{ px: 1 }}>
                  <Typography
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    <Box
                      component={"span"}
                      sx={{
                        lineHeight: 0
                      }}
                    >
                      <StarBorderRounded sx={{ width: "20px", height: "20px" }} />
                    </Box>
                    <Box
                      component={"span"}
                      sx={{
                        lineHeight: 1
                      }}
                    >
                      Done
                    </Box>
                  </Typography>
                </Box>
                <Box sx={{ px: 1 }}>
                  <Button
                    variant='contained'
                    fullWidth={true}
                    sx={{
                      borderRadius: "12px"
                    }}
                  >
                    +
                  </Button>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    borderRadius: "12px",
                    height: "calc(100vh - 180px)",
                    overflowY: "auto",
                    padding: 1
                  }}
                >
                  {tasks.map((item, i) => (
                    <Box
                      sx={{
                        background: "#E4E4EE",
                        padding: 2,
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        boxShadow: "0px 0px 4px 1px #80808050"
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        <Typography
                          variant={"body1"}
                          sx={{ fontWeight: 600 }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant={"body2"}
                          sx={{ color: (theme) => theme.palette.primary.main }}
                        >
                          {item.category}
                        </Typography>
                      </Box>
                      <Typography
                        variant={"caption"}
                        sx={{
                          color: "#808080",
                          fontWeight: 500,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word', // optional, helps with long words
                        }}
                      >
                        {item.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1
                            }}
                          >
                            <MessageOutlined sx={{ width: "18px", height: "18px" }} />
                            <Typography>4</Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1
                            }}
                          >
                            <Box
                              sx={{
                                transform: "rotate(45deg)",
                                display: "flex"
                              }}
                            >
                              <AttachFileOutlined sx={{ width: "18px", height: "18px" }} />
                            </Box>
                            <Typography>4</Typography>
                          </Box>
                        </Box>
                        <AvatarGroup
                          total={item.assignees.length}
                          slotProps={{
                            surplus: {
                              sx: {
                                width: "24px", height: "24px", fontSize: "12px"
                              }
                            }
                          }}
                        >
                          {item.assignees.slice(0, 2).map(assignee => (
                            <Avatar alt={assignee.name} sx={{ width: "24px", height: "24px" }} />
                          ))}
                        </AvatarGroup>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1
                        }}
                      >
                        <Typography variant={"body2"}>{`${progress}%`}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          aria-label="Export data"
                          sx={{
                            width: "100%",
                            borderRadius: 8,
                          }}
                        />
                        <Typography variant={"body2"}>{"1/5"}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Fragment>
  )
}

export default Tasks