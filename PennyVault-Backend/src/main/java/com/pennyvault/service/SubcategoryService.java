package com.pennyvault.service;

import com.pennyvault.entity.Category;
import com.pennyvault.entity.Subcategory;
import com.pennyvault.repository.CategoryRepository;
import com.pennyvault.repository.SubcategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubcategoryService {

    private final SubcategoryRepository subcategoryRepository;
    private final CategoryRepository categoryRepository;

    public List<Subcategory> getSubcategoriesByCategory(Long categoryId) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        return subcategoryRepository.findByCategory(category);
    }
}