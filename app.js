const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dataBasePath = path.join(__dirname, "cricketTeam.db");
let db = null;

const app = express();

app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at localhost://3000");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    select * from cricket_team;`;
  const getPlayersArray = await db.all(getPlayersQuery);
  response.send(
    getPlayersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getSinglePlayer = `
  SELECT * FROM cricket_team
  WHERE 
    player_id = ${playerId};
    `;
  const player = await db.get(getSinglePlayer);
  response.send(convertDbObjectToResponseObject(player));
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayersQuery = `
  INSERT INTO
    cricket_team(player_name,jersey_number,role)
    values('${playerName}','${jerseyNumber}','${role}')
  `;
  const insertPlayersArray = await db.run(postPlayersQuery);
  response.send("Player Added to Team");
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayer = `
  update cricket_team set player_name= '${playerName}', jersey_number = '${jerseyNumber}', role = '${role}' `;
  const player = await db.run(updatePlayer);
  response.send("Player Details Updated");
});
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    delete from cricket_team where player_id = ${playerId}`;
  const player = await db.run(deletePlayer);
  response.send("Player Removed");
});
module.exports = app;
