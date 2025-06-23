import { CreateUserDto } from '@shared-types';

export type RegistrationFormData = Pick<CreateUserDto, keyof CreateUserDto>
