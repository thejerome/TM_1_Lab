package vlab.server_java.generate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import rlcp.generate.GeneratingResult;
import rlcp.server.processor.generate.GenerateProcessor;
import vlab.model.GenerateCodeResult;
import vlab.model.GenerateInstructionsResult;

import java.math.BigDecimal;

/**
 * Simple GenerateProcessor implementation. Supposed to be changed as needed to
 * provide necessary Generate method support.
 */
public class GenerateProcessorImpl implements GenerateProcessor {

    public static final BigDecimal ONE = new BigDecimal("1");
    public static final BigDecimal THREE = new BigDecimal("3");
    public static final BigDecimal SIX = new BigDecimal("3");

    @Override
    public GeneratingResult generate(String condition) {
        ObjectMapper mapper = new ObjectMapper();

        //do Generate logic here
        String text = "Ваш вариант загружен в установку";
        String code = null;
        try {
            code = mapper.writeValueAsString(new GenerateCodeResult(new BigDecimal[]{THREE, SIX}, ONE));
        } catch (JsonProcessingException e) {
            code = "Failed, " + e.getOriginalMessage();
        }
        String instructions = null;
        try {
            instructions = mapper.writeValueAsString(new GenerateInstructionsResult(ONE, ONE));
        } catch (JsonProcessingException e) {
            code = "Failed, " + e.getOriginalMessage();
        }


        return new GeneratingResult(text, code, instructions);
    }
}
