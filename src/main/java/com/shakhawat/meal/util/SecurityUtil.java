package com.shakhawat.meal.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public class SecurityUtil {

    private SecurityUtil() {
        throw new IllegalStateException("Utility class");
    }

    public static String sanitizeInput(String input) {
        if (input == null) {
            return null;
        }
        return Jsoup.clean(input, Safelist.none());
    }

    public static String sanitizeForDisplay(String input) {
        if (input == null) {
            return null;
        }
        return Jsoup.clean(input, Safelist.basic());
    }
}
