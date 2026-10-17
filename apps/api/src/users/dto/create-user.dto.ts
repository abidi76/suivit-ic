import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { Role } from '../../generated/prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email invalide.' })
  @Matches(/@(edunet\.tn|ecolenumerique\.tn)$/, {
    message: "L'email doit se terminer par @edunet.tn ou @ecolenumerique.tn.",
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsString()
  @IsNotEmpty()
  prenom!: string;

  @IsString()
  @IsOptional()
  matricule?: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsEnum(Role, { message: 'Rôle invalide.' })
  role!: Role;

  @IsString()
  @MinLength(10, { message: 'Le mot de passe doit contenir au moins 10 caractères.' })
  @Matches(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une majuscule.' })
  @Matches(/[a-z]/, { message: 'Le mot de passe doit contenir au moins une minuscule.' })
  @Matches(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre.' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Le mot de passe doit contenir au moins un symbole.' })
  motDePasse!: string;

  // Rattachements (optionnels selon le rôle)
  @IsString()
  @IsOptional()
  creId?: string;

  @IsString()
  @IsOptional()
  etablissementId?: string;

  @IsString()
  @IsOptional()
  laboId?: string;

  @IsString()
  @IsOptional()
  societeId?: string;

  @IsString()
  @IsOptional()
  marcheId?: string;
}