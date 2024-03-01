import { Grid } from "@mantine/core"
import { ConnectKitButton } from "connectkit"
import { useNavigate } from "react-router-dom"

export function Topbar() {
  const navigate = useNavigate()

  return (
    <Grid align="center" style={{ padding: "10px 0" }}>
      <Grid.Col span="content" style={{
        cursor: "pointer"
      }} onClick={() => {
        navigate("/")
      }}>
        <h2 style={{ margin: 0 }}>Sendify</h2>
      </Grid.Col>
      <Grid.Col span="auto" />
      <Grid.Col span={1} >
        <ConnectKitButton />
      </Grid.Col>
    </Grid>
  )
}