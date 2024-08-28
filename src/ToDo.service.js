import StructureJSON from "./StructureJSON.js";
import { promises as fs } from "fs";
import readline from "readline";

class ToDoList {
  async generateRequest() {
    const petition = await this.getCLI(
      "¿Que accion desea hacer?\nadd\nupdate\ndelete\nmarkInProgress\nmarkInDone\nlist\nlistByStatus\n\n"
    );
    switch (petition) {
      case "add":
        await this.addTaskToList();
        break;
      case "list":
        await this.listView();
        break;
      case "listByStatus":
        const status = await this.getCLI(
          'Ingrese el status de las tareas que desea visualizar "todo, done, in-progress": '
        );
        await this.listByStatus(status);
        break;
      case "update":
        await this.updateTask();
        break;
      case "markInProgress":
        this.setStatus("in-progress");
        break;
      case "markInDone":
        this.setStatus("done");
        break;
      case "delete":
        this.deleteTask();
        break;
      default:
        console.log("\n ##### Indique una accion valida ##### \n");
        await this.generateRequest();
        break;
    }
  }
  async listView() {
    let list;
    try {
      list = await fs.readFile("./ToDo.json", "utf-8");
      if (list.length <= 0) {
        console.log("No hay tareas en el JSON");
      }
    } catch (e) {
      console.log(
        "---------------------------------------------\nNo existen tareas, por favor agrege una tarea\n---------------------------------------------"
      );
      await this.generateRequest();
    }

    for (let item of JSON.parse(list)) {
      console.log(item);
    }
    return await this.generateRequest();
  }

  async addTaskToList() {
    let jsonFile;
    let jsonArray;
    const description = await this.getCLI(
      "Ingrese la tarea que desea agregar: "
    );
    //Obtener ultima ultimo numero
    const id = await this.lastItemJson();
    const currentDate = new Date();
    //Armado JSON
    let structJson = new StructureJSON(
      id,
      description.trim(),
      "todo",
      currentDate,
      "null"
    );

    const task = structJson.toJSON();

    const taskItem = [JSON.parse(task)];

    try {
      jsonFile = await fs.readFile("./ToDo.json", "utf-8");
      jsonArray = JSON.parse(jsonFile);
    } catch (parseError) {
      console.error("Error al parsear el archivo JSON:", parseError);
      await fs.writeFile("ToDo.json", JSON.stringify(taskItem), "utf8");
      console.log("Tarea creada exitosamente.");
      console.log(`ID: ${taskItem[0].id}`);
      return await this.generateRequest();
    }
    if (!Array.isArray(jsonArray)) {
      console.error("El archivo JSON no contiene un array.");
      return;
    }

    jsonArray.push(...taskItem);

    const updatedJsonString = JSON.stringify(jsonArray, null, 2);

    // Escribir la cadena JSON actualizada de nuevo en el archivo
    await fs.writeFile("ToDo.json", updatedJsonString, "utf8");
    console.log("Tarea agregada exitosamente.");

    console.log(`ID: ${taskItem[0].id}`);

    return await this.generateRequest();
  }

  async fsJson() {
    let jsonFile;
    let jsonArray;
    try {
      jsonFile = await fs.readFile("./ToDo.json", "utf-8");
      jsonArray = JSON.parse(jsonFile);
    } catch (e) {
      fs.writeFile("ToDo.json", value, (error) => {
        console.log(error);
      });
    }
    return jsonArray;
  }

  async getCLI(query) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise((resolve) => {
      rl.question(query, (answer) => {
        // Cerrar la interfaz de readline después de recibir la respuesta
        rl.close();
        // Resolver la promesa con la respuesta
        resolve(answer);
      });
    });
  }

  async lastItemJson() {
    let jsonArray;
    try {
      jsonArray = await this.fsJson();
    } catch (parseError) {
      console.error("Error al parsear el archivo JSON:", parseError);
      return 1;
    }

    if (!Array.isArray(jsonArray)) {
      console.error("El archivo JSON no contiene un array.");
      return;
    }
    const lastItem = jsonArray.length - 1;

    let lastItemJson = jsonArray[lastItem];

    return lastItemJson.id + 1;
  }

  async updateTask() {
    // await this.listView();
    let jsonArray = await this.fsJson();
    let foundItem = [];
    for (let item of jsonArray) {
      console.log(item);
    }
    const id = await this.getCLI(
      "indique el id de la tarea que desee actualizar: "
    );
    const numberId = Number(id)
    if (isNaN(numberId)) {
      console.log("Ingrese un numero valido");
      return await this.updateTask();
    }

    for (let item of jsonArray) {
      if (item.id == numberId) {
        foundItem.push(item);
      }
    }
    if (foundItem.length) {
      const newDescription = await this.getCLI(
        "Escriba la nueva descripcion: "
      );
      for (let item of jsonArray) {
        if (item.id == id) {
          item.description = newDescription;
          item.update = new Date();
        }
      }
      const updatedJsonString = JSON.stringify(jsonArray, null, 2);

      // Escribir la cadena JSON actualizada de nuevo en el archivo
      await fs.writeFile("ToDo.json", updatedJsonString, "utf8");
      console.log("tarea actualizada exitosamente.");
      console.log(`ID: ${id}`);

      return await this.generateRequest();
    } else {
      console.log("Indique un id de tarea valido");
      return await this.updateTask();
    }
  }

  async setStatus(status) {
    let jsonArray = await this.fsJson();
    for (let item of jsonArray) {
      console.log(item);
    }
    const id = await this.getCLI(
      "Ingrese el Id de la tarea que desea actualizar: "
    );
    if (isNaN(id)) {
      console.log("Ingrese un numero valido");
      return await this.setStatus();
    }
    for (let item of jsonArray) {
      if (item.id == id) {
        item.status = status;
      }
    }
    const updatedJsonString = JSON.stringify(jsonArray, null, 2);

    // Escribir la cadena JSON actualizada de nuevo en el archivo
    await fs.writeFile("ToDo.json", updatedJsonString, "utf8");
    console.log("Tarea actualizada exitosamente.");
    return await this.generateRequest();
  }

  async listByStatus(status) {
    let jsonArray = await this.fsJson();
    let filterJson = [];
    for (let item of jsonArray) {
      if (item.status == status) {
        filterJson.push(item);
      }
    }
    if (filterJson <= 0) {
      console.log("No hay tareas con este estatus");
      return this.generateRequest();
    }
    console.log(...filterJson);
    return this.generateRequest();
  }

  async deleteTask() {
    let jsonArray = await this.fsJson();
    for (let item of jsonArray) {
      console.log(item);
    }
    const id = await this.getCLI(
      "Ingrese el Id de la tarea que desea actualizar: "
    );
    for (let i = 0; i < jsonArray.length; i++) {
      if (jsonArray[i].id == id) {
        jsonArray.splice(i, 1);
      }
    }
    const updatedJsonString = JSON.stringify(jsonArray, null, 2);

    // Escribir la cadena JSON actualizada de nuevo en el archivo
    await fs.writeFile("ToDo.json", updatedJsonString, "utf8");
    console.log("Tarea eliminada exitosamente.");
    return await this.generateRequest();
  }
}

const toDoList = new ToDoList();
toDoList.generateRequest();
