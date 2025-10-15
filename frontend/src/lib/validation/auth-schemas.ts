import { z } from "zod";


export const LoginSchema = z.object({
    identifier: z.string().min(3),
    password: z.string().min(6),
});


export const RegisterSchema = z.object({
    name: z.string().min(1),
    emailOrUsername: z.string().min(3),
    password: z.string().min(6),
    confirm: z.string().min(6),
});