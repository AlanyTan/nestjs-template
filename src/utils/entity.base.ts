import { AfterLoad, AfterInsert, AfterUpdate, AfterRemove } from "typeorm";

export class EntityBase {
  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  @AfterRemove()
  removeNulls(): void {
    Object.entries(this).forEach(([key, value]) => {
      if (value === null) {
        delete this[key as keyof this];
      }
    });
  }
}
