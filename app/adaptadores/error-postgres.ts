import { DatabaseError } from "pg";

export default class ErrorPostgres {
  private static readonly CODIGO_VIOLACION_DE_UNICIDAD = "23505";

  public static esViolacionDeUnicidad(error: unknown): boolean {
    return error instanceof DatabaseError && error.code === ErrorPostgres.CODIGO_VIOLACION_DE_UNICIDAD;
  }
}
