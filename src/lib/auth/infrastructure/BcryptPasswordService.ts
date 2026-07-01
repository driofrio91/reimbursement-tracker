import bcrypt from "bcryptjs";

import { PasswordService } from "@/lib/auth/application/ChangeOwnPasswordUseCase";

export class BcryptPasswordService implements PasswordService {
  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, 10);
  }
}
