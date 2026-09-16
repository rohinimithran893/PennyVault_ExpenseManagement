package com.pennyvault.repository;

import com.pennyvault.entity.Category;
import com.pennyvault.entity.Subcategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubcategoryRepository extends JpaRepository<Subcategory, Long> {

    List<Subcategory> findByCategory(Category category);

}