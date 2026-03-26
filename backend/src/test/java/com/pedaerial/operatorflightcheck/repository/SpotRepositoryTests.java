package com.pedaerial.operatorflightcheck.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.pedaerial.operatorflightcheck.entity.Role;
import com.pedaerial.operatorflightcheck.entity.Spot;
import com.pedaerial.operatorflightcheck.entity.User;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class SpotRepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SpotRepository spotRepository;

    @Test
    void findByUserIdReturnsSavedSpotsForPilot() {
        User owner = createUser("pilot@pedaerial.com");
        User otherPilot = createUser("other-pilot@pedaerial.com");

        spotRepository.save(createSpot(owner, "Sunset Cliffs", true));
        spotRepository.save(createSpot(owner, "Harbor Overlook", false));
        spotRepository.save(createSpot(otherPilot, "Downtown Roof", true));

        List<Spot> spots = spotRepository.findByUserId(owner.getId());

        assertThat(spots)
            .hasSize(2)
            .extracting(Spot::getLabel)
            .containsExactlyInAnyOrder("Sunset Cliffs", "Harbor Overlook");
    }

    @Test
    void saveAssignsIdCreatedAtAndDefaultFavorite() {
        User owner = createUser("favorite-test@pedaerial.com");
        Spot spot = createSpot(owner, "Pier Launch", null);

        Spot savedSpot = spotRepository.save(spot);

        assertThat(savedSpot.getId()).isNotBlank();
        assertThat(savedSpot.getCreatedAt()).isNotNull();
        assertThat(savedSpot.getFavorite()).isFalse();
    }

    private User createUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash("hashed-password");
        user.setRole(Role.USER);
        return userRepository.save(user);
    }

    private Spot createSpot(User user, String label, Boolean favorite) {
        Spot spot = new Spot();
        spot.setUser(user);
        spot.setLabel(label);
        spot.setAddress(label + ", CA");
        spot.setLat(new BigDecimal("33.618900"));
        spot.setLon(new BigDecimal("-117.929800"));
        spot.setNotes("Saved launch location");
        spot.setFavorite(favorite);
        return spot;
    }
}
