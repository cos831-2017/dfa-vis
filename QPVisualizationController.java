package rest.server;

import java.io.IOException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

/**
 *
 * @author Débora
 */
@RestController

public class QPVisualizationController {
    
@PostMapping("/query_processing")
    ModelAndView visualization(@RequestBody String csv) throws IOException {
        CSVTable tbl = new CSVTable(csv);       
//        for (Iterator<ArrayList<String>> it = tbl.rows.iterator(); it.hasNext();) {
//            ArrayList<String> elemento = (ArrayList<String>) it.next();
//            System.out.println("-----linha----");
//            for (String ele: elemento){
//                System.out.println(ele);   
//            }
//        }    
        ModelAndView modelAndView = new ModelAndView("query_processing/visualization");
        modelAndView.addObject("table", tbl);
        return modelAndView;
    }
}