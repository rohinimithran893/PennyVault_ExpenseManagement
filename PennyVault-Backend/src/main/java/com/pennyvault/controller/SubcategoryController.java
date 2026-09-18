package com.pennyvault.controller;

import com.pennyvault.entity.Subcategory;
import com.pennyvault.service.SubcategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcategories")
@RequiredArgsConstructor
public class SubcategoryController {

    private final SubcategoryService subcategoryService;

    @GetMapping("/category/{categoryId}")
    public List<Subcategory> getSubcategoriesByCategory(
            @PathVariable Long categoryId,
            Authentication authentication) {

        return subcategoryService.getSubcategoriesByCategory(categoryId);
    }
}