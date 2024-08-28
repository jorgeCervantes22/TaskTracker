export default class StructureJSON{

    id;
    description;
    status;
    createdAt;
    updatedAt;

    constructor(id,description,status,createdAt,updatedAt){
        this.id = id
        this.description = description
        this.status = status
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }

    toJSON() {
        return JSON.stringify({
            id: this.id,
            description: this.description,
            status: this.status,
            created: this.createdAt,
            update: this.updatedAt
        }, null, 2);
    }
}
