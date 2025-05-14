import 'reflect-metadata';
import { Elysia } from 'elysia';
import { Module, Controller, Factory, initializeApp } from './decorators';
import { Get, Post, Put, Patch, Delete } from './http-methods';

// Re-export everything
export {
  // Core decorators
  Module,
  Controller,
  
  // HTTP Method decorators
  Get,
  Post,
  Put,
  Patch,
  Delete,
  
  // Application factory and initializer
  Factory,
  initializeApp
}; 