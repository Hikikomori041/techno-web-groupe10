export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    provider: string;
    roles: string[];
    avatar?: string;
    googleId?: string;
    createdAt: string;
}

export interface ApiError {
    message: string;
    statusCode?: number;
}


export interface Product{
    _id: string;
    nom: string;
    prix: number;
    description: string;
    images: string[];
    specifications: {};
    id_categorie: string;
}

export interface Category{
    _id:string,
    id_categorie_mere: {
        _id: string,
    }
    name:string
}