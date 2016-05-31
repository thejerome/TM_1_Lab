package vlab.server_java.generate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import rlcp.generate.GeneratingResult;
import rlcp.server.processor.generate.GenerateProcessor;
import vlab.server_java.model.GenerateCodeResult;
import vlab.server_java.model.GenerateInstructionsResult;
import vlab.server_java.model.util.HtmlParamEscaper;

import java.math.BigDecimal;

import static vlab.server_java.model.util.HtmlParamEscaper.escapeParam;

/**
 * Simple GenerateProcessor implementation. Supposed to be changed as needed to
 * provide necessary Generate method support.
 */
public class GenerateProcessorImpl implements GenerateProcessor {

    public static final BigDecimal ONE = new BigDecimal("1");
    public static final BigDecimal THREE = new BigDecimal("3");
    public static final BigDecimal SIX = new BigDecimal("3");
    public static final BigDecimal OTHREE = new BigDecimal("0.3");
    public static final BigDecimal OONE = new BigDecimal("0.1");

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
            instructions = mapper.writeValueAsString(new GenerateInstructionsResult(OTHREE, OONE));
        } catch (JsonProcessingException e) {
            code = "Failed, " + e.getOriginalMessage();
        }

        return new GeneratingResult(text, escapeParam(code), escapeParam(instructions));
    }
}
