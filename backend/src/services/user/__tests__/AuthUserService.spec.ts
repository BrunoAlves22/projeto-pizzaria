import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { AuthUserService } from "../AuthUserService";
import prismaClient from "../../../prisma";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

jest.mock("../../../prisma", () => ({
  user: {
    findFirst: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

const findFirstMock = prismaClient.user.findFirst as jest.MockedFunction<
  typeof prismaClient.user.findFirst
>;
const compareMock = compare as jest.MockedFunction<typeof compare>;
const signMock = sign as jest.MockedFunction<typeof sign>;

const fakeUser = {
  id: "user-id-123",
  name: "Bruno",
  email: "bruno@email.com",
  password: "hashed_password",
  role: "STAFF" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("AuthUserService", () => {
  let service: AuthUserService;

  beforeEach(() => {
    service = new AuthUserService();
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
  });

  it("deve retornar id, name, email, role e token quando o login for bem-sucedido", async () => {
    findFirstMock.mockResolvedValue(fakeUser);
    compareMock.mockResolvedValue(true as never);
    signMock.mockReturnValue("fake_token" as never);

    const result = await service.execute({
      email: "bruno@email.com",
      password: "123456",
    });

    expect(result).toEqual({
      id: fakeUser.id,
      name: fakeUser.name,
      email: fakeUser.email,
      role: fakeUser.role,
      token: "fake_token",
    });
  });

  it("deve lançar erro se o usuário não existir", async () => {
    findFirstMock.mockResolvedValue(null);

    await expect(
      service.execute({ email: "naoexiste@email.com", password: "123456" }),
    ).rejects.toThrow("E-mail ou senha incorretos");
  });

  it("deve lançar erro se a senha estiver incorreta", async () => {
    findFirstMock.mockResolvedValue(fakeUser);
    compareMock.mockResolvedValue(false as never);

    await expect(
      service.execute({ email: "bruno@email.com", password: "senha_errada" }),
    ).rejects.toThrow("E-mail ou senha incorretos");

    expect(signMock).not.toHaveBeenCalled();
  });

  it("deve chamar compare com a senha informada e o hash do banco", async () => {
    findFirstMock.mockResolvedValue(fakeUser);
    compareMock.mockResolvedValue(true as never);
    signMock.mockReturnValue("fake_token" as never);

    await service.execute({ email: "bruno@email.com", password: "123456" });

    expect(compareMock).toHaveBeenCalledWith("123456", "hashed_password");
  });

  it("deve chamar sign com os dados do usuário e o JWT_SECRET", async () => {
    findFirstMock.mockResolvedValue(fakeUser);
    compareMock.mockResolvedValue(true as never);
    signMock.mockReturnValue("fake_token" as never);

    await service.execute({ email: "bruno@email.com", password: "123456" });

    expect(signMock).toHaveBeenCalledWith(
      { name: fakeUser.name, email: fakeUser.email },
      "test_secret",
      { subject: fakeUser.id, expiresIn: "1d" },
    );
  });
});
